g++ src.cpp -g -o a
a
fc src.out std.out
echo Correct>result.txt
if errorlevel==1 echo Wronganswer >result.txt
