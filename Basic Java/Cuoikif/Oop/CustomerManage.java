package Oop;

import java.util.ArrayList;
import java.util.Scanner;

public class CustomerManage {
    public static void sortByArthur(ArrayList<Books> books) {
        for (int i=0; i< books.size()-1; i++) {
            for (int j=0; j< books.size(); j++) {
                if (books.get(i).getArthur().compareTo(books.get(j).getArthur())>0) {
                    Books tmp = books.get(i);
                    books.set(i, books.get(j));
                    books.set(j, tmp);
                }
            }
        }
        printInfo(books);
    }
    public static void printInfo(ArrayList<Books> books) {
        for (Books book : books) {
            System.out.println(book.getArthur());
        }
    }
    public static ArrayList<Customer> readDataOfCustomer() {
        ArrayList<Customer> customers = new ArrayList<>();
        Scanner sc =new Scanner(System.in);
        int n = sc.nextInt();
        for (int i=0; i< n; i++) {
            System.out.println("Khach hang thu: " + (i+1));
            String id = sc.nextLine();
            String name = sc.nextLine();
            int quantity = sc.nextInt();
            ArrayList<String> list = new ArrayList<>();

            for (int j=0 ; j< quantity; j++) {
                list.add(sc.nextLine());
            }
            int VIP = sc.nextInt();
            customers.add(new Customer(id, name, list, VIP));
        }
        return customers;
    }
    public static double[] getAmount(ArrayList<Books> books, ArrayList<Customer> customers){
        double[] arr = new double[customers.size()];
        for (int x=0; x< customers.size();x++) {
            double amount = 0;
            for (int i=0; i< customers.get(x).getList().size(); i++) {
                for (Books book : books) {
                    if (books.get(x).getId().equals(customers.get(x).getList().get(i))) {
                        if (customers.get(x).getVIP() == 1) {
                            amount += book.getPrice() - (100 - book.getDiscount()) / 100;
                        } else {
                            amount += book.getPrice();
                        }
                    }
                }
            }
            arr[x] += amount/1000;
        }
        return arr;
    }
}
