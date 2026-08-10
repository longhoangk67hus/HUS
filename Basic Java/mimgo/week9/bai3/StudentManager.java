package week9.bai3;

import java.util.Scanner;

public class StudentManager{

    private Student[] studentArray;
    private int n;


    // Nhập số sinh viên n và danh sách sinh viên từ bàn phím
    // Chú ý việc đọc dữ liệu, Có thể đọc dữ liệu theo từng dòng, rồi dùng các phương thức parse tương ứng với từng loại dữ liệu để chuyển sang kiểu dữ liệu mong muốn
    // Ví dụ đọc vào  số sinh viên trên dòng đầu tiên  n = Integer.parseInt(reader.nextLine());
    //       Đọc vào điểm số double diemso = Double.parseDouble(reader.nextLine());
    // Sinh viên vẫn có thể đọc dữ liệu theo từng kiểu riêng như nextInt, nextDouble(),.. Nhưng cần chú ý đến việc chuyển con trỏ đến dòng tiếp theo nếu muốn đọc vào 1 dòng
    // bằng lệnh nextLine();
    public void inputStudents()
    {
        // Chú ý tạo đối tượng Scanner để đọc dữ liệu
        // Không khai báo biến n mới, dùng biến n của lớp
        // Khai báo cấp phát cho mảng studentArray với kích thước n
        // Mỗi phần tử trong mảng studentArray là 1 đối tượng Student, cần được khởi tạo.
        Scanner sc= new Scanner(System.in);
        this.n= sc.nextInt();
        Student[] studentArray = new Student[n];
        for (int i=0; i< n; i++) {
            sc.nextLine();
            String name = sc.nextLine();
            String id =sc.nextLine();
            double score =sc.nextDouble();
            studentArray[i] = new Student(name, id, score);
        }
    }

    public void printStudents()
    {
        for (Student student : studentArray) {
            student.printInfor();
        }
    }

    public static void main(String[] args)
    {

        StudentManager studentmanager = new StudentManager();
        studentmanager.inputStudents();
        studentmanager.printStudents();

    }


}