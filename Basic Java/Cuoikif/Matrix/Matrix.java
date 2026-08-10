package Matrix;

import java.util.Scanner;

public class Matrix {
    public static void inputMatrix(int[][] matrix, Scanner sc) {
        for (int i=0; i< matrix.length; i++) {
            for (int j=0; j< matrix[0].length; j++) {
                matrix[i][j] = sc.nextInt();
            }
        }
    }
//    public static int[] sumColumn(int[][] arr) {
//        int[] arr2 = new int[arr[0].length];
//        for (int j=0; j< arr[0].length; j++) {
//            arr2[j]=0;
//            for (int i=0; i< arr.length; i++) {
//                arr2[j] += arr[i][j];
//            }
//        }
//        return arr2;
//    }
    public static int[] sumRow(int[][] arr) {
        int[] arr2 = new int[arr.length];
        for (int i=0; i< arr.length; i++) {
            arr2[i] = 0;
            for (int j=0; j< arr[0].length; j++) {
                arr2[i] += arr[i][j];
            }
        }
        return arr2;
    }
    public static int[][] addMatrices(int[][] leftMatrix, int[][] rightMatrix) {
        int[][] sumMatrices = new int[leftMatrix.length][leftMatrix[0].length];
        for (int i=0; i< leftMatrix.length; i++) {
            for (int j=0; j< leftMatrix[0].length;j++) {
                sumMatrices[i][j] = leftMatrix[i][j] + rightMatrix[i][j];
            }
        }
        return sumMatrices;
    }
    public static int[][] getUpperTriangleMatrices(int[][] matrix) {
        for (int i=0; i< matrix.length; i++) {
            for (int j=0; j< matrix[0].length; j++) {
                if (i > j ){
                    matrix[i][j] =0;
                }
            }
        }
        return matrix;
    }
    public static int[][] getLowerTriangleMatrices(int[][] matrix) {
        for (int i=0; i< matrix.length; i++) {
            for (int j=0; j < matrix[0].length; j++) {
                if (i < j) {
                    matrix[i][j]=0;
                }
            }
        }
        return matrix;
    }
    public static int[][] timesMatrices(int[][] matrix1, int[][] matrix2) {
        int[][] multiMatrix = new int[matrix1.length][matrix1[0].length];
        for (int i=0; i< matrix1.length; i++) {
            for (int j=0; j <matrix1.length; j++) {
                for (int m=0; m< matrix1[0].length;m++) {
                    multiMatrix[i][j] = matrix1[i][m] + matrix2[m][j];
                }
            }
        }
        return multiMatrix;
    }
    public static void printMatrix (int[][] matrix) {
        for (int i=0; i< matrix.length; i++) {
            for (int j=0; j< matrix[0].length;j ++) {
                System.out.println(matrix[i][j] + " ");
            }
        }
    }
    public static void printArray(int[] array) {
        for (int j : array) {
            System.out.print(j + " ");
        }
    }

    public static void main(String[] args) {
        Scanner sc= new Scanner(System.in);
        int n = sc.nextInt();
        int m= sc.nextInt();
        int[][] matrix = new int[n][m];
        inputMatrix(matrix, sc);
        printArray(sumColumn(matrix));
    }
    public static int[] sumColumn(int[][] matrix) {
        int[] arr = new int[matrix.length];
        for (int j=0;j< matrix[0].length;j++) {
            arr[j]=0;
            for (int[] ints : matrix) {
                arr[j] += ints[j];
            }
        }
        return arr;
    }
}
