package homework2.ex2;

import java.util.List;

public class QuickSort<T extends Comparable<T>> {
    public void sort(List<T> list) {
        quickSort(list, 0 , list.size() - 1);
    }
    private void quickSort(List<T> list, int low, int high) {
        if (low < high) {
            int partitionIndex = partition(list, low, high);

            quickSort(list, low, partitionIndex - 1);
            quickSort(list, partitionIndex + 1, high);
        }
    }
    private int partition(List<T> list, int low, int high) {
        T pivot = list.get(high);
        int i = low - 1;

        for (int j = low; j < high; j++) {
            if (list.get(j).compareTo(pivot) <= 0) {
                i++;
                T temp = list.get(i);
                list.set(i, list.get(i));
                list.set(j ,temp);
            }
        }

        T temp = list.get(i + 1);
        list.set(i + 1, list.get(high));
        list.set(high,temp);

        return i + 1;
    }
}
