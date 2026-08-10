package week7;

public class test {
    public static boolean isPrime(int number) {
        /* TODO */
        if (number < 2)  return false;

        for (int i=2; i<= Math.sqrt(number); i++) {
            if (number % i == 0) {
                return false;
            }
        }
        return true;
    }
    public static int[] getPrimesInUpperTriangularMatrix(int[][] matrix) {
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
}
