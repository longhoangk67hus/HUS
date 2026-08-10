//Viết chương trình cho phép đọc 3 tham số từ đối dòng lệnh và trả về kết quả là true nếu 3 giá trị bằng nhau và là false nếu ngược lại.
// - Chú ý giá trị của tham số là kiểu xâu ký tự (String) chứ không bắt buộc phải là số.
package week1;

public class TripleEquals {
    public static void main(String[] args) {
        System.out.println(args[0].equals(args[1]) && args[1].equals(args[2]));
    }
}
