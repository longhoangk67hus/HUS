package NullPointerException;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Formatter;
import java.util.Scanner;

public class ManageStudent {
    public static void readFile(ArrayList<Student> sts , String filename) {
        Scanner scan = null;
        try {
            scan = new Scanner(new File(filename));
            int n = Integer.parseInt(scan.nextLine());
            for (int i=0; i< n; i++) {
                String id = scan.nextLine();
                String name = scan.nextLine();
                double score = Double.parseDouble(scan.nextLine());
                Student a = new Student(id, name, score);
                sts.add(a);

            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } finally {
            scan.close();
        }
    }
    public static void writeFile(ArrayList<Student> students, String filename) {
        Formatter fmt = null;
        try {
            fmt = new Formatter(new File(filename));
            for (Student s : students) {
                fmt.format(s + "/n");
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } finally {
            fmt.close();
        }

    }

    public static void printStudent(ArrayList<Student> sts) {
        for (Student s : sts) {
            System.out.println(s.toString());
        }
    }

    public static void main(String[] args) {
        ArrayList<Student> alStudent = new ArrayList<>();
        readFile(alStudent, "/Users/ngoclong7204/Documents/Workspace/Exception/src/NullPointerException/data.txt");
        printStudent(alStudent);
        writeFile(alStudent, "/Users/ngoclong7204/Documents/Workspace/Exception/src/NullPointerException/output.txt");

    }
}
