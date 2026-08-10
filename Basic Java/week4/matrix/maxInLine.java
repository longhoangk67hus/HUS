package matrix;

import java.util.Scanner;

public class maxInLine {
    public static void findMaxInRow(int[][] arr ) {
        for (int i = 0; i< arr.length; i++) {
            int max = arr[i][0];
            for (int j =1; j< arr[0].length; j++) {
                if (arr[i][j] > max ) {
                    max = arr[i][j];
                }
            }
            System.out.print(max + " ");
        }
    }

    public static void findMaxInColumn(int[][] arr) {
        for (int i = 0; i < arr[0].length;i++) {
            int max = arr[0][i];
            for (int j =0; j < arr.length; j++) {
                if (max < arr[j][i]) {
                    max = arr[j][i];
                }
            }
            System.out.print(max + " ");
        }
    }
    public static void arverageInRow(int[][] arr) {

        for (int i = 0; i < arr.length; i++) {
            double sum = 0;
            for (int j = 0; j < arr[0].length; j++) {
                sum += arr[i][j];
            }
            double average = Math.round(sum / (double) (arr.length) * 100.0) / 100.0;
            System.out.println(average);
        }
    }
    public static void averageInColumn(int[][] arr) {
        for (int i= 0 ; i< arr[0].length; i++) {
            double sum = 0;
            for (int j=0; j< arr.length; j++) {
                sum += arr[j][i];
            }
            double average = Math.round(sum/(double) (arr.length) *100.0) /100.0;
            System.out.println(average);
        }
    }
    public static int sumArray(int[][] arr1, int[][] arr2) {
        int sum =0;
        for (int i= 0; i < arr1.length;i++) {
            for (int j= 0; j < arr1.length; j++) {
                sum += arr1[i][j] + arr2 [i][j];
            }
        }
        return sum;
    }
    public static boolean isSymmetricalMatrix(int[][] array1) {
        for (int i = 0; i < array1.length; i++) {
            for (int j = 0; j < array1.length; j++) {
                if (array1[i][j] != array1[j][i]) {
                    return false;
                }
            }
        }
        return true;
    }
    public static void main(String[] args) {
        int[][] array = {{1, 2, 3}, {4,5,6}, {7,8,9}};
        int[][] array2 = {{1,2,3},{4,5,6},{7,8,9}};
        findMaxInRow(array);
        findMaxInColumn(array);
        arverageInRow(array);
        averageInColumn(array);
        System.out.println(sumArray(array,array2));
        System.out.println(isSymmetricalMatrix(array));

    }

}
