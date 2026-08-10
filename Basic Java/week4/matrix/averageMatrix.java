package matrix;

import java.util.Scanner;

public class averageMatrix {
    public static double average(int[][] array) {
        int sum = 0;
        for (int i =0; i < array.length; i++) {
            for (int j = 0; j < array[0].length; j++) {
                sum += array[i][j];
            }
        }
        double average = Math.round(sum/(double)(array.length *array[0].length) * 100)/ 100.0;
        return average;
    }

    public static void main(String[] args) {
        Scanner sc =new Scanner(System.in);
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] arr = new int[m][n];
        for (int i =0; i < arr.length; i++) {
            for (int j = 0; j < arr[i].length; j++) {
                arr[i][j] =sc.nextInt();
            }
        }
        System.out.println(average(arr));

    }
}
