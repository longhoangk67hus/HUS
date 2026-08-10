package week9.bai4;

import week9.bai4.Book;

public class TextBook extends Book {

    private boolean status;


    public TextBook(String id, String name, int quantity, String publisher, double price, boolean status) {
        super(id, name, quantity, publisher,price);
        this.status =status;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    @Override
    public double getAmount() {
        // TODO Auto-generated method stub

    }

    @Override
    public String toString() {
        return "TextBook [status=" + status + ", getId()=" + getId() + ", getName()=" + getName() + ", getQuantity()="
                + getQuantity() + ", getPublisher()=" + getPublisher() + ", getPrice()=" + getPrice() + ", getAmount()="
                + getAmount() + "]";
    }
}
