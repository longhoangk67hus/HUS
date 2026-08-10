package PreTest.Bai2;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class CustomerManagement {
    public static ArrayList<Book> readData(String filename) {
        Scanner input = null;
        ArrayList<Book> listBook = new ArrayList<>();
        try {
            input = new Scanner(new File(filename));
            while (input.hasNext()) {
                input.nextLine();
                String id = input.nextLine();
                String name = input.nextLine();
                String author = input.nextLine();
                int price = Integer.parseInt(input.nextLine());
                double percent = Double.parseDouble(input.nextLine());
                Book book = new Book(id, name, author, price, percent);
                listBook.add(book);
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return listBook;
    }
    public ArrayList<Book> sortName(ArrayList<String> arrayList) {
        for (int i =0; i < arrayList.size(); i++) {
            for (int j= i+1; j< arrayList.size(); j++) {
                if (arrayList.get(i).
            }
        }


    }
}
