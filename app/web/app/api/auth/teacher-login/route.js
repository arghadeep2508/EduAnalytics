import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { teacherId, password } = await request.json();

    if (!teacherId || !password) {
      return Response.json(
        { error: "Teacher ID and password are required" },
        { status: 400 }
      );
    }

    // For demo purposes, we'll use a simple password check
    // In production, use proper password hashing
    const teachers = await sql`
      SELECT t.*, s.name as school_name, s.board 
      FROM teachers t
      JOIN schools s ON t.school_id = s.school_id
      WHERE t.teacher_id = ${teacherId}
    `;

    if (teachers.length === 0) {
      return Response.json(
        { error: "Invalid teacher ID" },
        { status: 401 }
      );
    }

    const teacher = teachers[0];

    return Response.json({
      success: true,
      teacher: {
        id: teacher.teacher_id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        school: teacher.school_name,
        board: teacher.board,
        schoolId: teacher.school_id
      }
    });

  } catch (error) {
    console.error("Teacher login error:", error);
    return Response.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
