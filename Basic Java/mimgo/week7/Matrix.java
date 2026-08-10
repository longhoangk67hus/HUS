package week7;

import java.util.Random;
import java.util.Scanner;


public class Matrix {

    public static void main(String[] args) {

        /* TODO */


    }

    /* Method to generate random matrix, used to test program */
    public static int[][] generateMatrix(int rows, int columns) {
        if ((rows <= 0) || (columns <= 0)) {
            return null;
        }

        Random randomGenerator = new Random();
        int[][] newMatrix = new int[rows][columns];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < columns; j++) {
                newMatrix[i][j] = Math.abs(randomGenerator.nextInt()) % 100;
            }
        }

        return newMatrix;
    }

    /* Method to check valid matrix */
    public static boolean isValid(int[][] matrix) {
        if ((matrix == null) || (matrix.length == 0) || (matrix[0].length == 0)) {
            return false;
        }
        return true;
    }

    /* Method to check valid array */
    public static boolean isValid(int[] array) {
        if ((array == null) || (array.length == 0)) {
            return false;
        }

        return true;
    }

    public static void inputMatrix(int[][] matrix, Scanner keyboard) {
        if (!isValid(matrix)) {
            return;
        }

        /* TODO */
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                matrix[i][j] = keyboard.nextInt();
            }
        }
    }

    public static int[][] inputMatrix(int rows, int columns, Scanner keyboard) {
        if ((rows <= 0) || (columns <= 0)) {
            return null;
        }

        /* TODO */
        int[][] matrix = new int[rows][columns];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < columns; j++) {
                matrix[i][j] = keyboard.nextInt();
            }
        }
        return matrix;
    }

    /* Method to print an array */
    public static void printArray(int[] array) {
        if (!isValid(array)) {
            return;
        }

        StringBuilder arrayString = new StringBuilder();
        for (int elem : array) {
            arrayString.append(elem).append(" ");
        }
        System.out.print(arrayString.toString().trim());
    }

    /* Method to print a matrix (2d array) */
    public static void printMatrix(int[][] matrix) {
        if (!isValid(matrix)) {
            return;
        }

        StringBuilder stringRow = new StringBuilder();
        for (int[] row : matrix) {
            stringRow.setLength(0);
            for (int elem : row) {
                stringRow.append(elem).append(" ");
            }
            System.out.println(stringRow.toString().trim());
        }
    }

    /* Method to add 2 matrices */
    public static int[][] addMatrices(int[][] leftMatrix, int[][] rightMatrix) {
        if ((!isValid(leftMatrix)) || (!isValid(rightMatrix))) {
            return null;
        }

        if ((leftMatrix.length != rightMatrix.length)
                || (leftMatrix[0].length != rightMatrix[0].length)) {
            return null;
        }

        /* TODO */
        int[][] newMatrix = new int[leftMatrix.length][leftMatrix.length];
        for (int i = 0; i < leftMatrix.length; i++) {
            for (int j = 0; j < leftMatrix[0].length; j++) {

                newMatrix[i][j] = leftMatrix[i][j] + rightMatrix[i][j];
            }
        }
        return newMatrix;
    }

    /* Method to sum columns of matrix */
    public static int[] sumColumns(int[][] matrix) {
        if (!isValid(matrix)) {
            return null;
        }

        /* TODO */
        int[] sumColumns = new int[matrix.length];
        for (int j = 0; j < matrix[0].length; j++) {
            int sum = 0;
            for (int i = 0; i < matrix.length; i++) {
                sum += matrix[i][j];
            }
            sumColumns[j] += sum;
        }
        return sumColumns;
    }

    /* Method to print sum of columns of matrix */
    public static void printSumColumns(int[][] matrix) {
        int[] sumArray = sumColumns(matrix);
        printArray(sumArray);
    }

    /* Method to delete a column of matrix */
    public static int[][] deleteCulumn(int[][] matrix, int index) {
        if (!isValid(matrix)) {
            return null;
        }

        if ((index < 0) || (index >= matrix[0].length)) {
            return matrix;
        }

        if (matrix[0].length == 1) {
            return null;
        }

        /* TODO */
        int rows = matrix.length;
        int columns = matrix[0].length;
        int[][] newMatrix = new int[rows][columns - 1];
        for (int i = 0; i < rows; i++) {
            for (int j = 0, currentColumn = 0; j < columns; j++) {
                if (j != index) {
                    newMatrix[i][currentColumn++] = matrix[i][j];
                }
            }
        }
        return newMatrix;
    }

    /* Method to print the matrix having a column deleted */
    public static void printDeleteCulumnMatrix(int[][] matrix, int index) {
        int[][] deleteMatrix = deleteCulumn(matrix, index);
        printMatrix(deleteMatrix);
    }

    /* Method to get upper triangular matrix of a matrix */
    public static int[][] getUpperTriangularMatrix(int[][] matrix) {
        if (!isValid(matrix)) {
            return null;
        }

        if (matrix.length != matrix[0].length) {
            return null;
        }

        /* TODO */
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                if (i > j) {
                    matrix[i][j] = 0;
                }
            }
        }
        return matrix;
    }

    /* Method to print upper triangular matrix of a matrix */
    public static void printUpperTriangularMatrix(int[][] matrix) {
        int[][] upperTriangularMatrix = getUpperTriangularMatrix(matrix);
        printMatrix(upperTriangularMatrix);
    }

    /* Method to check if a number is a prime */
    public static boolean isPrime(int number) {
        /* TODO */
        if (number < 2) return false;

        for (int i = 2; i <= Math.sqrt(number); i++) {
            if (number % i == 0) {
                return false;
            }
        }
        return true;
    }


    /* Method to get all primes in upper triangular matrix of a matrix */
    public static int[] getPrimesInUpperTriangularMatrix(int[][] matrix) {
        /* TODO */
        boolean[][] booleanMatrix = new boolean[matrix.length][matrix[0].length];
        int count = 0;
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                boolean check = isPrime(matrix[i][j]);
                if (check) {
                    booleanMatrix[i][j] = true;
                    count += 1;
                } else {
                    booleanMatrix[i][j] = false;
                }
            }
        }
        int[] result = new int[count];
        int idx = 0;
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[0].length; j++) {
                if (booleanMatrix[i][j]) {
                    result[idx] = matrix[i][j];
                    idx++;
                }
            }
        }
        return result;
    }

    /* Method to sort an array */
    public static void sortArrayInAscendingOrderUsingSelectionSort(int[] array) {
        if (!isValid(array)) {
            return;
        }

        int temp;
        int minIndex;
        for (int i = 0; i < array.length - 1; i++) {
            minIndex = i;
            // find index of the smallest element
            for (int j = i + 1; j < array.length; j++) {
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }

            // swap the smallest element and ith element
            if (minIndex != i) {
                temp = array[i];
                array[i] = array[minIndex];
                array[minIndex] = temp;
            }
        }
    }
}