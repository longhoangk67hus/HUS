package matrix;
import java.util.Scanner;
public class printMatrix {
    public static void printArray(int[][] arr) {
        for (int i=0; i< arr.length; i++) {
            for (int j =0; j< arr[i].length;j++) {
                System.out.print(arr[i][j] + " ");
            }
            System.out.println();
        }
    }
    public static void pritnArray2(int[][] arr) {
        for (int[] a:arr) {
            for (int i :a ) {
                System.out.print(i + " ");
            }
            System.out.println();
        }
    }
    public static void main(String[] args) {
     Scanner sc =new Scanner(System.in);
     int m = sc.nextInt();
     int n = sc.nextInt();
     int[][] array = new int[m][n];
     for (int i =0; i< array.length; i++) {
         for (int j = 0; j <array[i].length; j++) {
             array[i][j] = sc.nextInt();
         }
     }
    printArray(array);
     pritnArray2(array);
    }

}


