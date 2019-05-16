g++ src.cpp -g -o evaluation2
evaluation2
fc src.out std.out
echo Correct>result.txt
if errorlevel==1 echo Wronganswer >result.txt
