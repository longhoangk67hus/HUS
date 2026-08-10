#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>

#define N 5
#define R 4
#define TRUE 1

int chance = 0; 
int tick[2] = {0, 0}; 
int queue[N];
int idx = 0, outIdx = 0, count = 0;

void *producer(void *arg);
void *consumer(void *arg);
void produce_item(int *pItem);
void put_item(int item);
int take_item();
void consume_item(int item);

int main() {
    pthread_t pid, cid;
    pthread_create(&pid, NULL, producer, NULL);
    pthread_create(&cid, NULL, consumer, NULL);
    pthread_join(pid, NULL);
    pthread_join(cid, NULL);

    return 0;
}

void *producer(void *arg) {
    int item;
    printf("Pro: Hello\n");
    while (TRUE) {
        tick[0] = 1;
        chance = 1;
        while (tick[1] == 1 && chance == 1);
        produce_item(&item);
        put_item(item);
        tick[0] = 0;
        sleep(rand() % R);
    }
    return NULL;
}

void *consumer(void *arg) {
    int item;
    printf("Con: Hi\n");
    while (TRUE) {
        tick[1] = 1;
        chance = 0; 
        while (tick[0] == 1 && chance == 0);
        take_item(&item);
        consume_item(item);
        tick[1]= 0;
        sleep(rand() % R);
    }
    return NULL;
}

void produce_item(int *pItem) {
    *pItem= rand() % 100;
    printf("Pro: Produce item %d\n", *pItem);
}

void put_item(int item) {
    queue[idx] = item;
    idx = (idx + 1) % N;
    count++;
    printf("Pro: Enter item %d\n", item);
    if (count == N) printf("P: The queue is full\n");
}

int take_item() {
    int item = queue[outIdx];
    outIdx = (outIdx + 1) % N;
    count--;
    printf("Con: Get item %d\n", item);
    if (count == 0) printf("Con: The queue is empty\n");

    return item;
}

void consume_item(int item) {
    printf("Con: Item %d is delicious!\n", item);
}