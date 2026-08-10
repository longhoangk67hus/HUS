#include<stdio.h>
#include<unistd.h>
void main() {
    if (fork())
    {
        printf("A\n");
    } else {
        fork();
        fork();
        printf("B\n");
    }
    printf("C\n");
}