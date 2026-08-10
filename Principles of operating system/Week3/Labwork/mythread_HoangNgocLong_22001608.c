#include <pthread.h>
#include <stdio.h>
char *pHello="Hello world";
void *myThread(void* pStr) {
    printf("%s\n", (char*) pStr);
    printf("Thread has ended\n");
}
void main() {
    pthread_t tid;
    pthread_create(&tid, NULL, myThread, (void*) pHello);
    pthread_join(tid, NULL);
    printf("Parent process has ended\n");
}