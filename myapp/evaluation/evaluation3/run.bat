g++ src.cpp -g -o evaluation3
evaluation3
fc src.out std.out
echo Correct>result.txt
if errorlevel==1 echo Wronganswer >result.txt
