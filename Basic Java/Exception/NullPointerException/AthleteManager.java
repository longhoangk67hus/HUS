package NullPointerException;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class AthleteManager {

    /* Khởi tạo một ArrayList có kiểu Athlete
     * Khai báo một biến Scanner đọc dữ liệu từ tệp có tên filename
     * Đọc n
     * Đọc từng thuộc tính của một Athlete
     * Khởi tạo một đối tượng Athlete với các thuộc tính vừa đọc được từ file
     * Add vào ArrayList
     * */

    public static ArrayList<Athlete> readFile(String filename)
    {


        ArrayList<Athlete> at = new ArrayList<>();
        try {


            Scanner sc = new Scanner(new File(filename));
            sc = new Scanner(new File(filename));
            int n = sc.nextInt();
            while (sc.hasNext()) {
                sc.nextLine();
                String name = sc.nextLine();
                int year = sc.nextInt();
                sc.nextLine();
                String sport = sc.nextLine();
                double height = sc.nextDouble();
                double weight = sc.nextDouble();
                at.add(new Athlete(name, year, sport, weight, height));

            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        return at;
    }

    /*
     * In dữ liệu của từng vận động viên sử dụng toString()
     * Phương thức này không cần sửa gì
     */
    public static void print(ArrayList<Athlete> aths)
    {
        for(Athlete a: aths)
        {
            System.out.println(a.toString());
        }
    }

    /*
     * Tính chỉ số BMI của từng vận động viên
     * BMI được tính theo công thức BMI = cân nặng/(chiều cao *chiều cao)
     * Trong đó cân nặng được tính bằng kg, chiều cao được tính bằng m
     * In mỗi chỉ số BMI với 3 chữ số sau dấu phẩy, mỗi chỉ số cách nhau một dấu tab (\t)
     */
    public static void printBMIs(ArrayList<Athlete> aths)
    {
        for (Athlete athlete : aths) {
            double bmi = athlete.getWeight() / athlete.getHeight() /100 * athlete.getHeight() /100;
            System.out.printf("%.3f\t", bmi);
        }
    }

    /*
     * Tìm và trả về các vận động viên có môn thi đấu là sport (với sport sẽ được truyền vào cụ thể khi gọi hàm)
     */
    public static ArrayList<Athlete> findSport(ArrayList<Athlete> aths, String sport)
    {
        ArrayList<Athlete> list = new ArrayList<>();
        for (Athlete athlete : aths) {
            if (athlete.getSport().equals(sport)) {
                list.add(athlete);
            }
        }
        return list;
    }

    /*
     * Tìm và trả về các vận động viên có chiều cao cao nhất
     */
    public static ArrayList<Athlete> findAthlete(ArrayList<Athlete> aths)
    {
        ArrayList<Athlete> maxHeight = new ArrayList<>();
        Athlete max = aths.get(0);
        for (Athlete athlete : aths) {
            if (max.getHeight() < athlete.getHeight()){
                max = athlete;
            }
        }
        maxHeight.add(max);
        return maxHeight;

    }
    /*
     * Sắp xếp danh sách theo thứ tự từ điển của họ và tên (a-z)
     * In ra danh sách sau khi sắp xếp
     */
    public static void sort(ArrayList<Athlete> aths)
    {
        // Sắp xếp
        for (int i=0; i< aths.size()-1;i++) {
            for (int j=i+1; j< aths.size(); j++) {
                if (aths.get(i).getName().compareTo(aths.get(j).getName()) > 0) {
                    Athlete athlete = aths.get(i);
                    aths.set(i, aths.get(j));
                    aths.set(j, athlete);
                }
            }
        }


        // In danh sách sau khi sắp xếp
        print(aths);
    }

    // Hàm main không cần phải sửa gì

    public static void main(String[] args) {
        ArrayList<Athlete> aths = readFile("athletes.txt");
        print(aths);
        printBMIs(aths);
        System.out.println();
        print(findSport(aths, "Bong Chuyen"));
        print(findAthlete(aths));
        System.out.println("SORT: ");
        sort(aths);
    }
}

