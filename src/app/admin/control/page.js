'use client'
import React, { useEffect, useState } from 'react'

export default function Control() {

  // const [socket, setSocket] = useState(null);
  const [orders, setOrders] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [menuData, setMenuData] = useState([]);
  const [optionData, setOptionData] = useState([]);
  const [storeState, setStoreState] = useState(1);

  useEffect(() => {
    fetch('https://pstore-backendd.vercel.app/getOrder')
    .then((res) => res.json())
    .then((data) => setOrders(data))
    fetch('https://pstore-backendd.vercel.app/getMenuAvailability')
    .then((res) => res.json())
    .then((data) => setMenuData(data))
    fetch('https://pstore-backendd.vercel.app/getStoreState')
    .then((res) => res.json())
    .then((data) => setStoreState(data))
    fetch('https://pstore-backendd.vercel.app/getOptionAvailability')
    .then((res) => res.json())
    .then((data) => setOptionData(data))
  }, [refresh])

  // const sendMessage = (message) => {
  //   if (socket && socket.readyState === WebSocket.OPEN) {
  //     socket.send(message);
  //   } else {
  //     console.error('WebSocket is not connected');
  //   }
  // }

  // const showData = () => {
  //   document.getElementById('dataModal').showModal();
  // };
  const cfgData = () => {
    document.getElementById('cfgModal').showModal();
  };

  const OptionalList = ({ names }) => (
    <ul>
      {names.map((name, index) => (
        <li className='mt-2' key={index}>
          {name ? (
            <div className='tooltip tooltip-right' data-tip={name}>
              <img className='h-4' src='/optionalText.svg'></img>
            </div>
          ) : (
            <span className='invisible'></span>
          )}
          <br />
        </li>
      ))}
    </ul>
  )
  const List = ({ names }) => (
    <ul>
      {names.map((name, index) => (
        <li className='mt-2' key={index}>{name}<br /></li>
      ))}
    </ul>
  );

  const ExtraList = ({ names }) => (
    <ul>
      {names.map((name, {index}) => (
        <li className='mt-2' key={index}>{name === 1 ? "✔️" : "❌"}<br /></li>
      ))}
    </ul>
  );

  const handleOrder = async (orderId, uncheckFirst = false) => {
    const allInputs = document.querySelectorAll(`input[type="checkbox"][data-order-id="${orderId}"]`);

    if (uncheckFirst) {
      allInputs.forEach(input => input.checked = false);
    }
    const checkedValues = [];
    const uncheckedValues = [];

    for (const input of allInputs) {
      if (input.checked) {
        checkedValues.push(input.value);
      } else {
        uncheckedValues.push(input.value);
      }
    }

    if (!uncheckFirst && checkedValues.length === 0) {
      alert("Please check at least one box before proceeding.");
      return;
    }

    const body = {
      orderId: orderId,
      approvedOrders: checkedValues,
      rejectedOrders: uncheckedValues
    }

    try{
      const response = await fetch('https://pstore-backendd.vercel.app/changeStatus', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });

      if(response.ok){
        console.log('API response:', await response.json());
        setRefresh(!refresh)
      } else {
        console.error('API error:', response.statusText);
      }
    } catch(error){
      console.error('API error:', error);
    }
  };

  const handleToggleMenuAvailability = async (menuId, newAvailability) => {
    try {
      const response = await fetch('https://pstore-backendd.vercel.app/updateMenuAvailability', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menu_id: menuId, availability: newAvailability}),
      });
      if (!response.ok) {
        throw new Error('Failed to update menu availability')
      }
      setMenuData(prevMenuData => {
        return prevMenuData.map(item => {
          return item.menu_id === menuId ? { ...item, availability: newAvailability } : item;
        })
      })
      console.log('Menu availability updated successfully');
    } catch (error) {
      console.error('Error toggling menu availability', error);
    }
  }

  const handleToggleOptionAvailability = async (optionId, newAvailability) => {
    try {
      const response = await fetch('https://pstore-backendd.vercel.app/updateOptionAvailability', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ option_id: optionId, availability: newAvailability}),
      });
      if (!response.ok){
        throw new Error('Failed to update option availability')
      }
      setOptionData(prevOptionData => {
        return prevOptionData.map(item => {
          return item.option_id === optionId ? { ...item, availability: newAvailability } : item;
        })
      })
      console.log('Option availability updated successfully');
    } catch (error) {
      console.error('Error toggling option availability', error);
    }
  }

  const handleToggleStore = async (newState) => {
    try {
      const response = await fetch('https://pstore-backendd.vercel.app/updateStoreState', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: newState}),
      });
      if (!response.ok) {
        throw new Error('Failed to update store state')
      }
      setStoreState(newState)
    } catch (error) {
      console.error('Error toggling store state', error);
    }
  }

  return (
    <main className="flex flex-col bg-white scrollbar-hide overflow-auto">
      <div className='flex flex-row h-12 px-4 py-2 items-center justify-between shadow-md'>
        <div className='flex items-center'>
          <h2 className='font-bold'>พี่ช้าง อาหารตามสั่ง</h2>
          <input
           type="checkbox"
           className="toggle toggle-error ml-4"
           checked={storeState}
           onChange={() => handleToggleStore(event.target.checked)}
          />
          <p className='ml-2'>ปิด/เปิดร้าน</p>
        </div>

        <div className='flex items-center'>
          <button className=" btn btn-xs text-white font-bold bg-gray-600 mr-2"><a href='/admin/queue'>หน้าคิว</a></button>
          <button className=" btn btn-xs text-white font-bold bg-gray-600 mr-2"><a href='/admin/dashboard'>หน้าข้อมูล</a></button>
          <button className=" btn btn-xs text-white font-bold bg-gray-600 mr-2"><a href='/admin/slip'>หน้าสลิป</a></button>
          <button className=" btn btn-xs text-white font-bold bg-gray-600 mr-2" onClick={cfgData}> แก้ไข</button>
          {/* <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn-sm flex p-0 items-center">
              <img className='w-auto' src='/account.svg'></img>
            </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-36">
                <li><a>ข้อมูล</a></li>
                <li><a>ออกจากระบบ</a></li>
              </ul>
          </div> */}
        </div>
      </div>

      <div className="overflow-x-auto h-screen">
        <table className="table table-pin-rows">
          {/* head */}
          <thead>
            <tr>
              <th>ออเดอร์</th>
              <th>เมนู</th>
              <th>ความเผ็ด</th>
              <th>พิเศษ</th>
              <th>ไข่</th>
              <th>ภาชนะ</th>
              <th>เพิ่มเติม</th>
              <th>ออเดอร์รวม</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter((order) => !["rejected", "finished"].includes(order.order_status))
              .reduce((groupedOrder, item) => {
              const existingGroup = groupedOrder.find(
                (group) => group.order_id === item.order_id
                );
                if (existingGroup) {
                  existingGroup.order_menu_id.push(item.order_menu_id);
                  existingGroup.order_menu_status.push(item.order_menu_status);
                  existingGroup.menu.push(item.menu);
                  existingGroup.spicy.push(item.spicy);
                  existingGroup.extra.push(item.extra);
                  existingGroup.egg.push(item.egg);
                  existingGroup.optional_text.push(item.optional_text);
                  existingGroup.container.push(item.container);
                } else {
                  groupedOrder.push({
                    order_id: item.order_id,
                    order_menu_id: [item.order_menu_id],
                    order_status: item.order_status,
                    order_menu_status: [item.order_menu_status],
                    total_menu: item.total_menu,
                    menu: [item.menu],
                    spicy: [item.spicy],
                    extra: [item.extra],
                    egg: [item.egg],
                    optional_text: [item.optional_text],
                    container: [item.container],
                    queue_id: item.queue_id
                  });
                }
                // console.log(groupedOrder);
                return groupedOrder;
              }, []).map((order, index) => (
                <tr key={order.order_id}>
                <th>{index + 1}</th>
                <td><List names={order.menu.map((menu, menuIndex) => (
                  <span key={menuIndex}>
                    {order.order_menu_status[menuIndex] === 'rejected' ? (
                      <del>{menu}</del>
                    ) : (
                      menu
                    )}
                  </span>
                ))}/></td>
                <td><List names={order.spicy}/></td>
                <td><ExtraList names={order.extra}/></td>
                <td><List names={order.egg}/></td>
                <td><List names={order.container}/></td>
                <td><OptionalList names={order.optional_text}/></td>
                <td>{order.total_menu}</td>
                <td className='flex justify-center'>
                  {order.order_status === 'pending' ? (
                    <div className='flex gap-2'>
                      <div className='flex-col'>
                        {order.order_menu_id.map((menuId, menuIndex) => (
                          <div key={menuId}>
                            <label className='mr-2 text-coral font-bold'>รอการยืนยัน</label>
                            <input
                            type="checkbox"
                            className="checkbox checkbox-coral"
                            id={`checkbox-${menuId}-${order.order_id}`}
                            name={`checkbox-${menuId}-${order.order_id}`}
                            key={menuIndex}
                            value={menuId}
                            data-order-id={order.order_id}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="dropdown dropdown-end">
                        <button className="btn btn-sm text-white font-bold bg-coral h-full py-2 px-0">
                          <img className='w-auto h-7' src='/dropdown.svg'></img>
                        </button>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-36">
                            <li><a onClick={() => handleOrder(order.order_id)}>ยืนยัน</a></li>
                            <li><a onClick={() => handleOrder(order.order_id, true)}>ยกเลิก</a></li>
                        </ul>
                      </div>
                    </div>
                  ) : order.order_status === 'wait-pay' ? (
                    <p className='font-bold text-blue-700'>รอการชำระเงิน</p>
                  ) : order.order_status === 'approved' ? (
                    <p className='font-bold'>ได้รับการอนุมัติ</p>
                  ) : order.order_status === 'cooking' ? (
                    <p className='font-bold text-yellow-700'>กำลังทำ</p>
                  ) : (
                    <p className='font-bold text-red-700'>{order.order_status}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="dataModal" className="modal">
        <div className="modal-box bg-white flex flex-col p-0 w-full h-3/4">
          <form method="dialog">
            <button className="btn btn-xs btn-circle bg-white absolute right-2 top-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </form>
          <div className='grid grid-cols-2 px-4 pt-4'>
            <div className='flex flex-col '>
              <h2 className='font-bold'>เมนูขายดี</h2>
              <div className='mt-2'>
                <div className='flex flex-row'>
                <p className='mr-4'>1</p>
                <p>กระเพรา หมู</p>
                </div>
                <div className='flex flex-row mt-2'>
                <p className='mr-4'>2</p>
                <p>ผัดกระเทียม ไก่</p>
                </div>
                <div className='flex flex-row mt-2'>
                <p className='mr-4'>3</p>
                <p>สปาเกตตี้ หมู</p>
                </div>
                <div className='flex flex-row mt-2'>
                <p className='mr-4'>4</p>
                <p>ผัดกระเทียม หมู</p>
                </div>
                <div className='flex flex-row mt-2'>
                <p className='mr-4'>5</p>
                <p>ผัดกระเทียม กุ้ง</p>
                </div>
                <div className='flex flex-row mt-2'>
                <p className='mr-4'>6</p>
                <p>กระเพรา หมูกรอบ</p>
                </div>
              </div>
            </div>

            <div className='flex flex-col'>
              <h2 className='font-bold'>วัตถุดิบที่ใช้ในวันนี้</h2>
              <div className='grid grid-cols-2 gap-y-2 mt-2'>
                <p>หมูกรอบ</p>
                <p>18 จาน</p>
                <p>หมู</p>
                <p>16 จาน</p>
                <p>เบค่อน</p>
                <p>16 จาน</p>
                <p>ไก่</p>
                <p>15 จาน</p>
                <p>กุ้ง</p>
                <p>10 จาน</p>
                <p>ปลาหมึก</p>
                <p>8 จาน</p>
              </div>
            </div>
          </div> 
        </div>
      </dialog>

      <dialog id="cfgModal" className="modal">
        <div className="modal-box bg-white flex flex-col py-4 px-8 h-3/4 w-auto max-w-none">
          <form method="dialog">
            <button className="btn btn-xs btn-circle bg-white absolute right-2 top-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </form>
          <div className='flex px-4 pt-4'>
            <div className='flex flex-col mr-4'>
              <h2 className='font-bold'>แก้ไขเมนู</h2>
              <div className='grid grid-cols-3 gap-x-2 gap-y-2 mt-2'>
                {menuData.map(menuItem => (
                  <div key={menuItem.menu_id} className='flex flex-row items-center'>
                    <input
                      type="checkbox"
                      className="toggle toggle-xs toggle-error mr-2"
                      checked={menuItem.availability}
                      onChange={() => handleToggleMenuAvailability(menuItem.menu_id, event.target.checked)}
                    />
                    <p>{menuItem.menu_name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex flex-col'>
              <h2 className='font-bold'>แก้ไขวัตถุดิบ</h2>
              <div className='grid grid-cols-1 gap-y-2 mt-2'>
                {optionData.map(optionItem => (
                  <div key={optionItem.option_id} className='flex flex-row items-center'>
                    <input
                      type="checkbox"
                      className="toggle toggle-xs toggle-error mr-2"
                      checked={optionItem.availability}
                      onChange={() => handleToggleOptionAvailability(optionItem.option_id, event.target.checked)}
                    />
                    <p>{optionItem.option_value}</p>
                  </div>
                ))}
                {/* <div className='flex flex-row items-center'>
                  <input type="checkbox" className="toggle toggle-xs toggle-error mr-2" />
                  <p>หมู</p>
                </div>
                <div className='flex flex-row items-center'>
                  <input type="checkbox" className="toggle toggle-xs toggle-error mr-2" />
                  <p>ไก่</p>
                </div>
                <div className='flex flex-row items-center'>
                  <input type="checkbox" className="toggle toggle-xs toggle-error mr-2" />
                  <p>หมูกรอบ</p>
                </div>
                <div className='flex flex-row items-center'>
                  <input type="checkbox" className="toggle toggle-xs toggle-error mr-2" />
                  <p>เบค่อน</p>
                </div>
                <div className='flex flex-row items-center'>
                  <input type="checkbox" className="toggle toggle-xs toggle-error mr-2" />
                  <p>กุ้ง</p>
                </div>
                <div className='flex flex-row items-center'>
                  <input type="checkbox" className="toggle toggle-xs toggle-error mr-2" />
                  <p>ปลาหมึก</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </dialog>
  </main>
  );
}