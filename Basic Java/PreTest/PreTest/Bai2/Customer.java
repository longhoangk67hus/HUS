package PreTest.Bai2;

import java.util.ArrayList;

public class Customer {
    private String id;
    private String name;
    private int vip;
    private ArrayList<String> idBook;

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

    public int getVip() {
        return vip;
    }

    public void setVip(int vip) {
        this.vip = vip;
    }

    public ArrayList<String> getIdBook(ArrayList<String> idBook){
        ArrayList<String> alIDBook = new ArrayList<>();
    alIDBook.addAll(idBook);
        return alIDBook;
    }
}
