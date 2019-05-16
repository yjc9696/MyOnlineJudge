g++ src.cpp -g -o evaluation1
evaluation1
fc src.out std.out
echo Correct>result.txt
if errorlevel==1 echo Wronganswer >result.txt
