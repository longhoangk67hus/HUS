package homework2.ex2;

import java.util.List;

public class MergeSort <T extends Comparable<T>>{
    public void sort(List<T> list) {
        if (list.size() <= 1) {
            return;
        }
        int mid = list.size() / 2;
        List<T> left = list.subList(0, mid);
        List<T> right = list.subList(mid, list.size());

        sort(left);
        sort(right);

        merge(list, left, right);

    }

    private void merge(List<T> list, List<T> left, List<T> right) {
        int leftIndex = 0, rightIndex = 0, listIndex = 0;

        while (leftIndex < left.size() && rightIndex < right.size()) {
            if (left.get(leftIndex).compareTo(right.get(rightIndex)) <= 0) {
                list.set(listIndex++, left.get(leftIndex++));
            } else {
                list.set(listIndex++, right.get(rightIndex++));
            }
        }

        while (leftIndex < left.size()) {
            list.set(listIndex++, left.get(leftIndex++));
        }

        while (rightIndex < right.size()) {
            list.set(listIndex++, right.get(rightIndex++));
        }
    }

}
