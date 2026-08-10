package week4;
// in ra các số nguyên tố có trong mảng


import java.util.Scanner;

public class PrimesInArray {
    public static boolean checkPrime(int n) {
        if (n<2) {
            return false;
        }
        for (int i = 2; i < n; i++) {
            if (n % i == 0) {
                return false;
            }
        }return  true;
    }



    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] array = new int[n];
        for (int i = 0; i < array.length; i++) {
            array[i] = sc.nextInt();
        }

        for (int i =0; i < array.length; i++) {
            if (checkPrime(array[i])) {
                System.out.print(array[i] + " ");
            }
        }
    }
}


