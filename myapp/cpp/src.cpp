#include<cstdio>
#include<algorithm> 
using namespace std;
const int N=100000;
int a[N],b[N];
bool com(const int &o,const int &p)
{
	return a[o]<a[p];
}
int main()
{
	freopen("src.in","r",stdin);
	freopen("src.out","w",stdout);
	int n;
	scanf("%d",&n);
	for (int i=1;i<=n;i++)
	scanf("%d",&a[i]),b[i]=i;
	sort(&b[1],&b[n+1],com);
	double s=0;
	double ss=0;
	for (int i=1;i<=n;i++)
	s+=ss,ss+=a[b[i]];
	for (int i=1;i<n;i++)
	{
		printf("%d ",b[i]);
	}
	printf("%d\n",b[n]);
	printf("%.2lf\n",s/n);
 } 
