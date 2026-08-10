package homework4.training8;

import java.util.LinkedList;
import java.util.Queue;

public class RecentCall {
    Queue<Integer> queue;
    public RecentCall() {
        queue = new LinkedList<>();
    }
    public int ping(int t) {
        queue.add(t);
        while (t - queue.peek() > 3000) {
            queue.poll();
        }
        return queue.size();
    }

    public static void main(String[] args) {
        RecentCall recentCall = new RecentCall();

        // Add a request at time 1
        int count = recentCall.ping(1);
        System.out.println("Number of requests in the past 3000 milliseconds: " + count); // 1

        // Add a request at time 100
        count = recentCall.ping(100);
        System.out.println("Number of requests in the past 3000 milliseconds: " + count); // 2

        // Add a request at time 3001
        count = recentCall.ping(3001);
        System.out.println("Number of requests in the past 3000 milliseconds: " + count); // 3

        // Add a request at time 3002
        count = recentCall.ping(3002);
        System.out.println("Number of requests in the past 3000 milliseconds: " + count); // 3
    }
}
