import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import Card from "../components/Card";
import { ArrowUpRight, ArrowDownRight, Wallet, Percent } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie } from "recharts";

export default function Dashboard(){
  const {accessToken}=useAuth();
  const [month,setMonth]=useState(new Date().getMonth()+1);
  const [year,setYear]=useState(new Date().getFullYear());
  const [data,setData]=useState(null);
  const [trend,setTrend]=useState([]);

  const headers = useMemo(()=>({ headers:{ Authorization:`Bearer ${accessToken}`}}),[accessToken]);

  useEffect(()=>{
    if(!accessToken) return;
    api.get(`/api/dashboard/month-summary?month=${month}&year=${year}`, headers).then(r=>setData(r.data));
    const from=new Date(year, month-1, 1).toISOString();
    const to=new Date(year, month, 0).toISOString();
    api.get(`/api/dashboard/trend?from=${from}&to=${to}`, headers).then(r=>setTrend(r.data));
  },[accessToken,month,year]);

  const pieData = useMemo(()=> data?.categoryExpense?.map(x=>({name:x._id,value:x.total}))||[],[data]);

  const savingsRate = data ? (data.income>0 ? Math.max(0, ((data.income-data.expense)/data.income)*100) : 0) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your finances</p>
        </div>
        <div className="flex gap-2">
         <select
  value={month}
  onChange={(e) => setMonth(Number(e.target.value))}
  className="rounded-xl border border-black/10 dark:border-white/10
             bg-white dark:bg-zinc-950
             text-zinc-900 dark:text-zinc-50
             p-2"
>

            {Array.from({length:12}).map((_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
          <input value={year} onChange={e=>setYear(Number(e.target.value))} className="w-28 rounded-xl border p-2 bg-transparent" />
        </div>
      </div>

      {!data ? <p className="mt-6">Loading...</p> : (
        <>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Kpi icon={ArrowUpRight} label="Income" value={data.income} />
            <Kpi icon={ArrowDownRight} label="Expense" value={data.expense} />
            <Kpi icon={Wallet} label="Balance" value={data.balance} />
            <Kpi icon={Percent} label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} />
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2">
              <div className="font-semibold">Income vs Expense</div>
              <div className="h-72 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <XAxis dataKey="_id" hide />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="income" strokeWidth={2} dot={false} />
                    <Line dataKey="expense" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <div className="font-semibold">Category Spend</div>
              <div className="h-72 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Recent Transactions</div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="py-2">Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map(t=>(
                    <tr key={t._id} className="border-t border-black/5 dark:border-white/10">
                      <td className="py-2">{new Date(t.date).toLocaleDateString()}</td>
                      <td className={t.type==="income"?"text-green-600":"text-red-600"}>{t.type}</td>
                      <td>{t.categoryId?.name}</td>
                      <td>{t.amount}</td>
                      <td className="text-gray-500 dark:text-gray-400">{t.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({icon:Icon,label,value}){
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/10"><Icon/></div>
      </div>
    </Card>
  );
}
