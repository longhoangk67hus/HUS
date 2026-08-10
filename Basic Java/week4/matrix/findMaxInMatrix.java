package matrix;

import java.util.Scanner;

public class findMaxInMatrix {
    public static int findMax(int[][] array) {
        int max = array[0][0];
        for (int i =0; i < array.length; i++) {

            for (int j=0; j < array[i].length; j++) {
                if (array[i][j] > max ) {
                    max = array[i][j];
                }

            }
        }
        return max;
    }
    public static int findMin(int[][] array) {
        int min = array[0][0];
        for (int i = 0; i < array.length; i++) {

            for (int j = 0; j < array[i].length; j++) {
                if (array[i][j] < min) {
                    min = array[i][j];
                }

            }
        }
        return min;
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
        System.out.println(findMax(arr));
        System.out.println(findMin(arr));
    }
}
