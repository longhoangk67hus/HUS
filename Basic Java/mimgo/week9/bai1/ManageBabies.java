package week9.bai1;

import week9.bai1.Baby;

import java.util.Scanner;

public class ManageBabies {



	/*  Nhap vao thong tin cua n baby tu ban phim. Cac thong tin theo thu tu ten, ngay thang nam sinh, gioi tinh
	gioi tinh, can nang, chieu cao
	*/

    // nhap vao so nguyen duong n va thong tin cua n baby
    Baby[] createData (Scanner sc)
    {
        int n = sc.nextInt();
        Baby[] baby = new Baby[n];
        for (int i=0; i<n; i++){
            sc.nextLine();
            String day = sc.nextLine();
            String name = sc.nextLine();
            boolean gender = sc.nextBoolean();
            double weight = sc.nextDouble();
            double length = sc.nextDouble();
            baby[i] = new Baby(day, name, gender, weight, length);
        }
        return baby;
    }

    // In ra thong tin cua n baby sau khi chuan hoa ho ten
    void printInforBabies (Baby babies[])
    {
        for (Baby baby : babies) {
            baby.setName(baby.getName().trim());
            System.out.println(baby);
        }
    }
    // Sap xep cac baby theo trong luong giam dan
    void sortWeight (Baby babies[])
    {
        for (int i=0; i< babies.length-1; i++) {
            for (int j=i+1; j< babies.length; j++) {
                if (babies[i].getWeight() < babies[j].getWeight()) {
                    Baby baby = babies[i];
                    babies[i] = babies[j];
                    babies[j] = baby;

                }
            }
        }
    }
    // Loc ra tat ca nhung baby co gioi tinh la gender
    void filterGender(Baby babies[], String gender)
    {
        for (Baby baby : babies) {
            if (baby.getGender().equals(gender)) {
                System.out.println(baby);
            }
        }
    }
    public static void main(String[] args) {

    }

}

