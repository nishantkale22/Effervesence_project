
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { ChevronDown } from 'lucide-react';
import TaskDetails from './TaskDetailsNew';

const Tasks = ({ _id }) => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/user/tasks/${_id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
                );
                setTasks(data.tasks); // Set the fetched tasks
            } catch (err) {
                setError('Failed to fetch tasks.');
                console.error(err); // For debugging
            }
        };

        fetchTasks();

        // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
        // setTasks([
        //     {
        //         _id: 'dummy1',
        //         title: 'Dummy Task 1',
        //         description: 'This is a dummy task description.',
        //         taskStatus: 'Pending',
        //     },
        //     {
        //         _id: 'dummy2',
        //         title: 'Dummy Task 2',
        //         description: 'This is another dummy task description.',
        //         taskStatus: 'Completed',
        //     },
        // ]);
    }, [_id]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Tasks</h2>
            {error && (
                <p className="text-red-600 font-medium bg-red-100 p-2 rounded">{error}</p>
            )}

            {/* Tasks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={task._id}
                            className={`p-4 border rounded-lg shadow-sm flex flex-col justify-between
                                ${task.taskStatus === "complete"
                                    ? "bg-green-50 border-green-400"
                                    : "bg-white border-gray-300"
                                }`}>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                                <p className="text-gray-600 mt-1">{task.description}</p>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-between gap-2">
                                <button
                                    onClick={() => setSelectedTaskId(task._id)}
                                    className="text-blue-700 hover:bg-blue-50 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
                                    title="View Details"
                                    aria-label={`View details of ${task.title}`}
                                >
                                    View Details
                                    <ChevronDown size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full">No tasks assigned.</p>
                )}
            </div>

            {selectedTaskId && <TaskDetails _id={selectedTaskId}/>}
        </div>
    );
};

export default Tasks;
