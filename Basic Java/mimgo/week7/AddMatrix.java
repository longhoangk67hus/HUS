package week7;

/**
 * Program to add two matrices
 */

import java.util.Scanner;

public class AddMatrix {
    public static void main(String[] args) {
        // input rows
        // inputs columns
        // if using inputMatrix, allocate matrix first, and then pass matrix to inputMatrix method
        // if using generateMatrix, pass rows and columns to generateMatrix method, and then allocate matrix
        // call addMatrix to add the matrices
        // print matrix
        /* TODO */
        Scanner sc = new Scanner(System.in);
        int rows = sc.nextInt();
        ;
        int columns = sc.nextInt();
        int[][] matrix1 = new int[rows][columns];
        inputMatrix(matrix1, sc);
        int[][] matrix2 = new int[rows][columns];
        inputMatrix(matrix2, sc);
        print(addMatrix(matrix1, matrix2));

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

    public static int[][] addMatrix(int[][] leftMatrix, int[][] rightMatrix) {
        /* TODO */
        int[][] newMatrix = new int[leftMatrix.length][leftMatrix[0].length];
        for (int i = 0; i < newMatrix.length; i++) {
            for (int j = 0; j < newMatrix[0].length; j++) {
                newMatrix[i][j] = 2 * leftMatrix[i][j] + 3 * rightMatrix[i][j];
            }
        }
        return newMatrix;
    }

    public static void print(int[][] matrix) {
        /* TODO */
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; i++) {
                System.out.println(matrix[i][j] + " ");
            }
        }
    }
}
