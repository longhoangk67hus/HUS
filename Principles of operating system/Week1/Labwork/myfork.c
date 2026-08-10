#include<stdio.h>
#include<unistd.h>
int main() {
    int pid = fork();
    if (pid < 0 ) {
        printf("Cannot create the child process");
    
    }
    if (pid == 0) 
        printf("Hello from the child");
    else printf("hello from the parent. Child's pid= %d", pid);
    
    
}