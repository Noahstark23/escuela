import { getStudents } from "@/actions/students";
import { StudentList } from "@/components/students/StudentList";
import { NewStudentDialog } from "@/components/students/NewStudentDialog";
import { getMonthlyCollectionStats } from "@/actions/finance";
import { StudentDashboard } from "@/components/students/student-dashboard";

export default async function StudentsPage() {
    const students = await getStudents();
    const now = new Date();
    const collectionStats = await getMonthlyCollectionStats(now.getMonth(), now.getFullYear());

    // Calculate Dashboard Metrics
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === "ACTIVO").length;
    const retentionRate = totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

    // Mock debt calculation based on "Pending" status for current month
    // In a real app, we'd sum up unpaid invoices.
    const studentsWithDebt = students.length - (collectionStats.paidStudents?.length || 0);

    // Group by Grade
    const gradeMap = new Map<string, number>();
    students.forEach(s => {
        const count = gradeMap.get(s.grade) || 0;
        gradeMap.set(s.grade, count + 1);
    });
    const studentsByGrade = Array.from(gradeMap.entries()).map(([name, count]) => ({ name, count }));

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Estudiantes</h2>
                <div className="flex items-center space-x-2">
                    <NewStudentDialog />
                </div>
            </div>

            <StudentDashboard
                totalStudents={totalStudents}
                activeStudents={activeStudents}
                retentionRate={retentionRate}
                studentsWithDebt={studentsWithDebt}
                studentsByGrade={studentsByGrade}
            />

            <StudentList students={students} paidStudentIds={collectionStats.paidStudents} />
        </div>
    );
}
