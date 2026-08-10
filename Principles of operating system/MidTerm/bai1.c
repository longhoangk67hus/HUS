#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
int write_data(char* buf, size_t len){
    int check_check_turn = 0;
    char* file = "output.dat";
    int fileExist, fd;

     while (check_turn != pthread_self()){
        pthread_yield();
    }
    fileExist = check_file_existence(file);
    if(fileExist == FALSE){
        fd = open(file, O_CREATE);
        write(fd, buf, len)
    }
    check_turn = (check_turn + 1) % 2;
    return 0;
}
