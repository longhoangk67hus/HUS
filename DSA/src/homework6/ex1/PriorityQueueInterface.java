package homework6.ex1;

public interface PriorityQueueInterface<K,E> {
    public int size(); // Trả về size của array
    public boolean isEmpty(); // Check rỗng
    public void insert(Entry<K,E> entry); // Thêm vào phần tử
    public void insert(K k, E e); // Thêm vào phần tử
    public Entry<K, E> removeMin(); // Xoá đi phần tử bé nhất
    public Entry<K, E> min(); // Trả về phần tử nhỏ nhất

}
