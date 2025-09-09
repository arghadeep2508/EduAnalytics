import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { studentId, requesterType, requesterId, message, urgencyLevel = 'medium' } = await request.json();

    if (!studentId || !requesterType || !message) {
      return Response.json(
        { error: "Student ID, requester type, and message are required" },
        { status: 400 }
      );
    }

    // Get student data
    const student = await sql`
      SELECT s.*, sc.name as school_name 
      FROM students s
      JOIN schools sc ON s.school_id = sc.school_id
      WHERE s.student_id = ${studentId}
    `;

    if (student.length === 0) {
      return Response.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const studentData = student[0];

    // Find available counselor for the school
    const counselors = await sql`
      SELECT * FROM counselors 
      WHERE school_id = ${studentData.school_id}
      ORDER BY RANDOM()
      LIMIT 1
    `;

    let assignedCounselorId = null;
    if (counselors.length > 0) {
      assignedCounselorId = counselors[0].counselor_id;
    }

    // Create counselor request
    await sql`
      INSERT INTO counselor_requests (
        student_id, requester_type, requester_id, message, 
        urgency_level, assigned_counselor_id
      ) VALUES (
        ${studentId}, ${requesterType}, ${requesterId}, ${message},
        ${urgencyLevel}, ${assignedCounselorId}
      )
    `;

    // Create notification for counselor
    if (counselors.length > 0) {
      const counselor = counselors[0];
      const notificationMessage = `New counseling request for student ${studentData.name} (${studentId}) from ${studentData.school_name}. Message: ${message}`;
      
      await sql`
        INSERT INTO notifications (
          recipient_type, recipient_id, recipient_email, message_type,
          subject, message
        ) VALUES (
          'counselor', ${counselor.counselor_id}, ${counselor.email}, 'counselor_request',
          'New Counseling Request - ${urgencyLevel} Priority', ${notificationMessage}
        )
      `;

      // Also notify parents if urgency is high
      if (urgencyLevel === 'high' && studentData.parent_email) {
        const parentMessage = `Your child ${studentData.name} has requested counseling support. The school counselor has been notified and will reach out soon.`;
        
        await sql`
          INSERT INTO notifications (
            recipient_type, recipient_email, message_type,
            subject, message
          ) VALUES (
            'parent', ${studentData.parent_email}, 'counselor_request',
            'Counseling Request for ${studentData.name}', ${parentMessage}
          )
        `;
      }
    }

    return Response.json({
      success: true,
      message: "Counselor request submitted successfully",
      assignedCounselor: counselors.length > 0 ? {
        name: counselors[0].name,
        email: counselors[0].email,
        specialization: counselors[0].specialization
      } : null
    });

  } catch (error) {
    console.error("Counselor request error:", error);
    return Response.json(
      { error: "Failed to submit counselor request" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const counselorId = url.searchParams.get('counselorId');

    let requests;

    if (studentId) {
      // Get requests for a specific student
      requests = await sql`
        SELECT cr.*, c.name as counselor_name, c.email as counselor_email
        FROM counselor_requests cr
        LEFT JOIN counselors c ON cr.assigned_counselor_id = c.counselor_id
        WHERE cr.student_id = ${studentId}
        ORDER BY cr.created_at DESC
      `;
    } else if (counselorId) {
      // Get requests assigned to a specific counselor
      requests = await sql`
        SELECT cr.*, s.name as student_name, s.class_level, s.section
        FROM counselor_requests cr
        JOIN students s ON cr.student_id = s.student_id
        WHERE cr.assigned_counselor_id = ${counselorId}
        ORDER BY cr.urgency_level DESC, cr.created_at DESC
      `;
    } else {
      return Response.json(
        { error: "Either studentId or counselorId parameter is required" },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error("Error fetching counselor requests:", error);
    return Response.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
