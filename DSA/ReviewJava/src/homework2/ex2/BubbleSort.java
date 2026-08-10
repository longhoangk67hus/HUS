package homework2.ex2;

import java.util.List;

public class BubbleSort<T extends Comparable<T>> {
    public void sort(List<T> list) {
        int n = list.size();
//        for (int i = 0; i < n; i++) {
//            boolean swapped = false;
//            for (int j = 0; j < n - 1; j++) {
//                if (list.get(i - 1).compareTo(list.get(i)) > 0) {
//                    T temp = list.get(i - 1);
//                    list.set(i - 1, list.get(i));
//                    list.set(i, temp);
//                    swapped = true;
//                }
//                if (swapped) {
//                    break;
//                }
//            }
//
//        }
        boolean swapped;

        do {
            swapped = false;

            for (int i = 1; i < n; i++) {
                if (list.get(i - 1).compareTo(list.get(i)) > 0) {
                    T temp = list.get(i - 1);
                    list.set(i - 1, list.get(i));
                    list.set(i, temp);
                    swapped = true;
                }
            }

            n--; // Decrease the size of the unsorted portion
        } while (swapped);

    }
}
