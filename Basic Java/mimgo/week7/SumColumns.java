package week7;

/**
 * Nhập ma trận matrixA cỡ rows x columns, sau đó in ra tổng các phần tử của các cột.
 */

import java.util.Scanner;

public class SumColumns {
    public static void main(String[] args) {
        // input rows
        // input columns
        // call inputMatrix method to input values of the matrix, or call generateMatrix to generate a matrix
        // call sumColumns to sum columns of the matrix
        // print array
        /* TODO */
        Scanner sc = new Scanner(System.in);
        int rows = sc.nextInt();
        int columns = sc.nextInt();
        int[][] matrix = new int[rows][columns];

        inputMatrix(matrix, sc);
        printArray(sumColumns(matrix));

    }

    public static void inputMatrix(int[][] matrix, Scanner keyboard) {
        /* TODO */
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                matrix[i][j] = keyboard.nextInt();
            }
        }
    }

    public static void generateMatrix(int rows, int columns, Scanner keyboard) {
        /* TODO */
        int[][] matrix = new int[rows][columns];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < columns; j++) {
                matrix[i][j] = keyboard.nextInt();
            }
        }
    }

    public static int[] sumColumns(int[][] matrix) {
        /* TODO */
        int[] array = new int[matrix[0].length];
        for (int j = 0; j < matrix[0].length; j++) {
            for (int i = 0; i < matrix.length; i++) {
                array[j] += matrix[i][j];
            }
        }
        return array;
    }

    public static void printMatrix(int[][] matrix) {
        /* TODO */
        int m = matrix.length;
        int n = matrix[0].length;
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                System.out.println(matrix[m][n] + " ");
            }
            System.out.println();
        }

    }

    public static void printArray(int[] array) {
        /* TODO */
        for (int i = 0; i < array.length; i++) {
            System.out.println(array[i] + " ");
        }
    }
}