package homework2;

public class SortingContext {
    private ISort sortStrategy;

    public SortingContext(ISort sortStrategy) {
        this.sortStrategy = sortStrategy;
    }

    public void setSortStrategy(ISort sortStrategy) {
        this.sortStrategy = sortStrategy;
    }

    public void performSort(int[] array) {
        sortStrategy.sort(array);
    }
}
