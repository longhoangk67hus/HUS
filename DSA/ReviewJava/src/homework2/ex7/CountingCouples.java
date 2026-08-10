package homework2.ex7;


public class CountingCouples {
    public static void merge(int[] array, int low, int mid, int high) {
        int n1 = mid - low + 1;
        int n2 = high - mid;
        int[] leftSubArray = new int[n1];
        int[] rightSubArray = new int[n2];

        for (int i = 0; i < n1; i++) {
            leftSubArray[i] = array[low + i];
        }
        for (int j = 0; j < n2; j++) {
            rightSubArray[j] = array[mid + 1 + j];
        }

        int i = 0, j = 0, k = low;
        while (i < n1 && j < n2) {
            if (leftSubArray[i] <= rightSubArray[j]) {
                array[k] = leftSubArray[i];
                i++;
            } else {
                array[k] = rightSubArray[j];
                j++;
            }
            k++;
        }
        while (i < n1) {
            array[k] = leftSubArray[i];
            i++;
            k++;
        }

        while (j < n2) {
            array[k] = rightSubArray[j];
            j++;
            k++;
        }

    }

    public static void mergeSort(int[] array, int low, int high) {
        if (low < high) {
            int mid = low + (high - low) / 2;
            mergeSort(array, low, mid);
            mergeSort(array, mid + 1, high);

            merge(array, low, mid, high);

        }
    }


    private static int binarySearchLeft(int[] array, int left, int right, int target) {
        int result = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (array[mid] == target) {
                result = mid;
                right = mid - 1;
            } else if (array[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result;
    }

    private static int binarySearchRight(int[] array, int left, int right, int target) {
        int result = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (array[mid] == target) {
                result = mid;
                left = mid + 1;
            } else if (array[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result;
    }

    public static int countPairsWithSum(int[] array, int x) {
        int n = array.length;
        int count = 0;

        mergeSort(array, 0, n - 1);

        for (int i = 0; i < n; i++) {
            int i1 = binarySearchLeft(array, 0, i - 1, x - array[i]);
            int i2 = binarySearchRight(array, 0, i, x - array[i]);

            if (i1 != -1 && i2 != -1) {
                count += (i2 - i1 + 1);
            }

        }
        return count;
    }
    public static void printArray(int[] array) {
        for (int i:
            array ) {
            System.out.print(i + " ");
        }
    }

}

