package week03;


import java.util.Scanner;

public class MyArray {
    public static int findMax(int[] array) {
        int max = array[0];
        for (int i = 0; i < array.length; i++) {
            if (max < array[i]) {
                max = array[i];
            }
        }
        return max;
    }

    public static int findMin(int[] array) {

        int min = array[0];
        for (int i = 0; i < array.length; i++) {
            if (min > array[i]) {
                min = array[i];
            }
        }
        return min;
    }

    public static double average(int[] array) {
        int sum = 0;
        for (int i = 0; i < array.length; i++) {
            sum += array[i];
        }
        double average = sum / (double) array.length;
        return Math.round(average * 100.0) / 100.0;
    }

    public static double averageGreaterThan0(int[] array) {
        double sum = 0;
        int count = 0;
        for (int i = 0; i < array.length; i++) {
            if (array[i] > 0) {
                sum += array[i];
                count++;
            }
        }
        if (count == 0) {
            return 0;
        }
        double average = sum / (double) count;
        return Math.round(average * 100.0) / 100.0;
    }

    public static double averageOdd(int[] array) {
        double sum = 0;
        int count = 0;
        for (int i = 1; i < array.length; i += 2) {
            sum += array[i];
            count++;
        }
        if (count == 0) {
            return 0;
        }
        double average = sum / (double) count;
        return Math.round(average * 100.0) / 100.0;
    }

    public static boolean increasingArray(int[] array) {
        if (array.length == 0) {
            return false;
        }
        for (int i = 0; i < array.length - 1; i++) {
            if (array[i] > array[i + 1]) {
                return false;
            }
        }
        return true;
    }

    public static boolean csc(int[] array) {
        if (array.length <= 0) {
            return false;
        }
        double difference = array[1] - array[0];
        for (int i = 0; i < array.length - 1; i++) {
            if (array[i + 1] - array[i] != difference) {
                return false;
            }
        }
        return true;
    }

    public static boolean csn(int[] array) {
        if (array.length <= 0) {
            return false;
        }
        double difference = array[1] / array[0];
        for (int i = 0; i < array.length - 1; i++) {
            if (array[i + 1] / array[i] != difference) {
                return false;
            }
        }
        return true;
    }

    public static boolean primeNumber(int[] array) {
        int i = 2;
        for (int j = 0; j < array.length; j++) {
            if (array[j] / i == 0) {
                return false;
            }
            i++;
        }
        return true;
    }


    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] array2 = new int[n];
        int[] array = {-1, -3, -5, -7, -9};
        int[] array1 = {-1, 3, 5, 7, -5, -7};
        /*System.out.println();
        System.out.println("Phan tu max: " + findMax(array));
        System.out.println("Phan tu min: " + findMin(array));
        System.out.println("So trung binh: " + average(array));
        System.out.println("Trung binh cac phan tu lon hon 0: " + averageGreaterThan0(array));
        System.out.println("Trung binh cac phan tu o vi tri le: " + averageOdd(array));
        System.out.println("Mang hoi tu: " + increasingArray(array));
        System.out.println("La cap so cong: " + csc(array));
        System.out.println("La cap so nhan: " + csn(array));
        System.out.println();


        System.out.println("Phan tu max: " + findMax(array1));
        System.out.println("Phan tu min: " + findMin(array1));
        System.out.println("So trung binh: " + average(array1));
        System.out.println("Trung binh cac phan tu lon hon 0: " + averageGreaterThan0(array1));
        System.out.println("Trung binh cac phan tu o vi tri le: " + averageOdd(array1));
        System.out.println("Mang hoi tu: " + increasingArray(array1));
        System.out.println("La cap so cong: " + csc(array1));
        System.out.println("La cap so nhan: " + csn(array1));*/
        System.out.print(findMin(array2) + " " + findMax(array2));
    }
}
