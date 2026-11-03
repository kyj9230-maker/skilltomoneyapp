import { NextResponse } from "next/server";
import { courses } from "@/data/courses";

const SHEET_URL =
  process.env.SHEET_URL ||
  "https://script.google.com/macros/s/AKfycbzx8cC8yxhZxf8XL2so4v1vnF834SJHfhSDwKJTaaKpcOrskNnFYIKfNw-mAgBw-wii/exec";

export async function POST(request: Request) {
  try {
    if (!SHEET_URL) {
      return NextResponse.json(
        { result: "error", message: ".env에 SHEET_URL이 설정되어 있지 않습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { courseId, course, date, name, phone, people } = body;

    // 1. 이름 및 연락처 유효성 검사
    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { result: "error", message: "이름을 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!phone || !String(phone).trim()) {
      return NextResponse.json(
        { result: "error", message: "연락처를 입력해 주세요." },
        { status: 400 }
      );
    }

    // 2. 강좌 데이터에서 해당 강좌 조회 (ID 또는 이름 기준)
    const targetCourse = courses.find(
      (c) => (courseId !== undefined && c.id === courseId) || c.name === course
    );

    // 3. 인원 수 및 남은 자리 유효성 검사
    const peopleCount = Number(people);
    if (!people || isNaN(peopleCount) || peopleCount < 1) {
      return NextResponse.json(
        { result: "error", message: "신청 인원을 1명 이상 입력해 주세요." },
        { status: 400 }
      );
    }

    if (targetCourse) {
      const remainingSeats = targetCourse.seat - targetCourse.booked;
      if (peopleCount > remainingSeats) {
        return NextResponse.json(
          {
            result: "error",
            message: `신청 인원(${peopleCount}명)이 남은 자리(${remainingSeats}석)보다 많습니다.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. 결제 금액(total) 서버에서 직접 계산 (수강료 × 인원)
    const coursePrice = targetCourse ? targetCourse.price : 0;
    const total = coursePrice * peopleCount;

    // 날짜 및 강좌명 확정
    const finalCourseName = targetCourse ? targetCourse.name : course || "";
    const finalDate = targetCourse ? targetCourse.date : date || "";

    // 3. 구글 스프레드시트 Apps Script로 전송할 JSON 페이로드 구성
    const payload = {
      date: finalDate,
      course: finalCourseName,
      name: String(name).trim(),
      phone: String(phone).trim(),
      people: peopleCount,
      total: total,
    };

    // 4. 서버 측에서 구글 시트 웹 앱(SHEET_URL)으로 POST 요청 전송 (브라우저에 시트 주소 미노출)
    const response = await fetch(SHEET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({ result: "ok" }));

    return NextResponse.json({
      result: "ok",
      data,
      calculatedTotal: total,
    });
  } catch (error: unknown) {
    console.error("Reservation API Error:", error);
    return NextResponse.json(
      {
        result: "error",
        message:
          error instanceof Error
            ? error.message
            : "서버에서 예약 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
