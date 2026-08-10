package Oop;

public class Books {
    private String id;
    private String name;
    private String arthur;
    private int price;
    private double discount;

    public String getArthur() {
        return arthur;
    }

    public void setArthur(String arthur) {
        this.arthur = arthur;
    }

    public Books(String id, String name, String arthur, int price, double discount) {
        this.id = id;
        this.name = name;
        this.arthur = arthur;
        this.price = price;
        this.discount = discount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public double getDiscount() {
        return discount;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }
}
