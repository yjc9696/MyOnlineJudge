g++ src.cpp -g -o evaluation8
evaluation8
fc src.out std.out
echo Correct>result.txt
if errorlevel==1 echo Wronganswer >result.txt
