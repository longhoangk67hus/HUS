package Oop;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class BooksManage {
    public static ArrayList<Books> readBookData(String filename) {
        ArrayList<Books> books = new ArrayList<>();
        try {
            Scanner sc =new Scanner(System.in);
            while (sc.hasNext()) {
                String id = sc.nextLine();
                String name = sc.nextLine();
                String arthur = sc.nextLine();
                int price = sc.nextInt();
                double discount = sc.nextDouble();
                books.add(new Books(id, name, arthur, price, discount));
                sc.nextLine();
                sc.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return books;
    }

}
