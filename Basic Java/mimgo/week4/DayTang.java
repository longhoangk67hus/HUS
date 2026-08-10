package week4;

import java.util.Scanner;

public class DayTang {
    public static boolean checkDayTang(int[] array) {
        for (int i = 0; i < array.length - 1; i++) {
            if (array[i] > array[i + 1]) {
                return false;
            }

        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] array = new int[n];
        for (int i = 0; i < n; i++) {
            array[i] = sc.nextInt();
        }
        if (checkDayTang(array)) {
            System.out.println("YES");
        } else {
            System.out.println("NO");
        }
    }
}
