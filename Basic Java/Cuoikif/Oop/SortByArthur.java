package Oop;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Scanner;

public class SortByArthur {
    public static void sortByArthur(ArrayList<Books> books) {
        for (int i=0; i< books.size()-1; i++) {
            for (int j=0; j< books.size(); j++) {
                if (books.get(i).getArthur().compareTo(books.get(j).getArthur()) > 0) {
                    Books tmp = books.get(i);
                    books.set(i,books.get(j));
                    books.set(j,tmp);

                }
            }
        }
        printInfo(books);
    }
    public static void printInfo(ArrayList<Books> books) {
        for (Books book : books) {
            System.out.println(book.toString());
        }
    }
    public static ArrayList<Customer> readDataOfCustomer() {
        ArrayList<Customer> customers = new ArrayList<>();
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i=0; i< n; i++) {
            System.out.println("Thong tin khach hang thu " + (i+1));
            sc.nextInt();
            String id = sc.nextLine();
            String name = sc.nextLine();
            int quantity = sc.nextInt();
            sc.nextLine();
            ArrayList<String> list = new ArrayList<>();
            for (int j=0; j< quantity; j++) {
                list.add(sc.nextLine());
            }
            int VIP = sc.nextInt();
            customers.add(new Customer(id, name, list, VIP));
        }
        return customers;
    }
    public static double[] getAmount(ArrayList<Customer> customers, ArrayList<Books> books) {
        double[]  array= new double[customers.size()];
        for (int x=0; x< customers.size(); x++) {
            double amount =0;
            for (int i=0; i< customers.get(x).getList().size(); i++) {
                for (Books book : books) {
                    if (book.getId().equals(customers.get(x).getList().get(i))) {
                        if (customers.get(x).getVIP() == 1) {
                            amount += book.getPrice() * (100 - book.getDiscount()) / 100;
                        } else amount += book.getPrice();
                    }
                }
            }
            array[x] = amount /1000;
        }
        return array;
    }
    public static void writeToFile(ArrayList<Books> books, ArrayList<Customer> customers,  String filename) {
        try {
            FileWriter fileWriter = new FileWriter(filename);
            for (int x=0; x< customers.size(); x++) {
                fileWriter.write("Khach hang thu " + (x+1) + "\n");
                fileWriter.write("Ma KH: " + customers.get(x).getId()+ "\n");
                fileWriter.write("Ten khach hang: " + customers.get(x).getName());

                int number= 0;
                for (int i=0; i< customers.get(x).getList().size(); i++) {
                    for (Books book : books) {
                        if (books.get(i).getId().equals(customers.get(x).getList().get(i))) {
                            number++;
                            fileWriter.write(number + ". " + book.getId() + ", " + book.getName() + ", " + book.getArthur() + ", " + book.getPrice() + " (vnd), " + book.getDiscount() + "%.\n");
                        }
                    }
                }
                double[] amount = getAmount(customers,books);
                fileWriter.write("Tong tien: " + String.format("%.3f", amount[x])+ " (vnd) \n");
                fileWriter.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}