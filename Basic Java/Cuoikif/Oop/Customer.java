package Oop;

import java.util.ArrayList;

public class Customer {
    private String id;
    private String name;
    private ArrayList<String> list;
    private int VIP;

    public Customer(String id, String name, ArrayList<String> list, int VIP) {
        this.id = id;
        this.name = name;
        this.list = list;
        this.VIP = VIP;
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

    public ArrayList<String> getList() {
        return list;
    }

    public void setBooks(ArrayList<String> list) {
        this.list = list;
    }

    public int getVIP() {
        return VIP;
    }

    public void setVIP(int VIP) {
        this.VIP = VIP;
    }
}
