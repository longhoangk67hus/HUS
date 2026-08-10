package homework2;

public class SelectionSort implements ISort{
    public static void printArray(int[] array) {
        for (int i : array) {
            System.out.print(i + " ");
        }
        System.out.println();
    }

    public void selectionSort(int[] array) {
        int comparison = 0;
        int swaps = 0;
        for (int i = 0; i < array.length - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < array.length; j++) {
                comparison++;
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }
            int temp = array[i];
            array[i] = array[minIndex];
            array[minIndex] = temp;
            swaps++;
            System.out.println("Round " + (i + 1));
            printArray(array);
        }
        System.out.println("Comparison: " + comparison);
        System.out.println("Swaps: " + swaps);
    }

    @Override
    public void sort(int[] array) {
        selectionSort(array);
    }
}
