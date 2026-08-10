#include <stdio.h>
#include <unistd.h>
void main() {
    int pid;
    pid = fork();
    if (pid == 0)
    { // it's the  child process
        fork(); printf("medium\n");
        fork();
        fork(); printf("small\n");
    } 
    else printf("big\n");    
}
// Output: 1 big, 2 medium, 8 small.