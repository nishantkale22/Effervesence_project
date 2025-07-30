
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Trash2, CheckCircle, UploadCloud, Download, ChevronDownIcon, PlusIcon, ChevronUp } from "lucide-react";

const Allocations = ({ _id }) => {
    const [allocations, setAllocations] = useState([]);
    const [error, setError] = useState("");
    const [selectedAllocationId, setSelectedAllocationId] = useState(null);

    // Details states
    const [task, setTask] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [resources, setResources] = useState([]);
    const [newResource, setNewResource] = useState({
        title: "",
        description: "",
        fileType: "",
        fileUrl: "",
        selectedFile: null,
    });
    const [showUploadForm, setShowUploadForm] = useState(false);

    useEffect(() => {
        const fetchAllocations = async () => {
            try {
                const { data } = await axiosInstance.get(`/user/allocations/${_id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                });
                setAllocations(data.Tasks);
            } catch (err) {
                setError("Failed to fetch allocations.");
                console.error(err);
            }
        };

        fetchAllocations();

        // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
        // setAllocations([
        //     {
        //         _id: "dummy1",
        //         title: "Dummy Allocation 1",
        //         description: "This is a dummy allocation description.",
        //         taskStatus: "Pending",
        //     },
        //     {
        //         _id: "dummy2",
        //         title: "Dummy Allocation 2",
        //         description: "This is another dummy allocation description.",
        //         taskStatus: "Completed",
        //     },
        // ]);
    }, [_id]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedAllocationId) return;

            try {
                const { data } = await axiosInstance.get(`/user/taskdetails/${selectedAllocationId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                });
                setTask(data.task);
                setAssignedUsers(data.task.assignedTo);
                setResources(data.task.resources);
            } catch (err) {
                setError("Failed to fetch task details.");
                console.error(err);
            }
        };

        fetchDetails();

        // UNCOMMENT THIS WHEN TESTING & WHEN WANT DUMMY DATA
        // if (selectedAllocationId === "dummy1") {
        //     setTask({
        //         _id: "dummy1",
        //         title: "Dummy Task 1",
        //         description: "This is a dummy task description.",
        //         deadline: "2023-10-01T00:00:00Z",
        //         assignedBy: { name: "John Doe" },
        //         createdAt: "2023-10-01T00:00:00Z",
        //     });
        //     setAssignedUsers([
        //         { _id: "user1", name: "User One" },
        //         { _id: "user2", name: "User Two" },
        //     ]);
        //     setResources([
        //         {
        //             _id: "resource1",
        //             title: "Resource 1",
        //             description: "This is a dummy resource description.",
        //             fileType: "pdf",
        //             fileUrl: "https://example.com/resource1.pdf",
        //         },
        //     ]);
        // } else if (selectedAllocationId === "dummy2") {
        //     setTask({
        //         _id: "dummy2",
        //         title: "Dummy Task 2",
        //         description: "This is a DIFFERENT dummy task.",
        //         deadline: "2023-12-01T00:00:00Z",
        //         assignedBy: { name: "Jane Smith" },
        //         createdAt: "2023-12-01T00:00:00Z",
        //     });
        //     setAssignedUsers([
        //         { _id: "user3", name: "User Three" },
        //     ]);
        //     setResources([
        //         {
        //             _id: "resource2",
        //             title: "Resource 2",
        //             description: "This is another dummy resource description.",
        //             fileType: "image",
        //             fileUrl: "https://example.com/resource2.jpg",
        //         },
        //     ]);
        // }
    }, [selectedAllocationId]);

    const handleDeleteAllocation = async (allocationId) => {
        try {
            await axiosInstance.delete(`/user/allocations/${allocationId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            setAllocations((prev) => prev.filter((allocation) => allocation._id !== allocationId));
            if (selectedAllocationId === allocationId) setSelectedAllocationId(null);
        } catch (err) {
            setError("Failed to delete allocation.");
            console.error(err);
        }
    };

    const handleMarkAsComplete = async (allocationId) => {
        try {
            await axiosInstance.post(`/user/allocations/status/${allocationId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            setAllocations((prev) =>
                prev.map((allocation) =>
                    allocation._id === allocationId ? { ...allocation, taskStatus: "complete" } : allocation
                )
            );
        } catch (err) {
            setError("Failed to mark allocation as complete.");
            console.error(err);
        }
    };

    const handleResourceUpload = async (e) => {
        e.preventDefault();
        if (!newResource.fileUrl) {
            alert("Please upload a file first.");
            return;
        }

        try {
            const { data } = await axiosInstance.post(
                `/resource/post`,
                { user_id: _id, _id: selectedAllocationId, resource: newResource },
                { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
            );
            setResources([...resources, data.newResource]);
            setNewResource({ title: "", description: "", fileType: "", fileUrl: "", selectedFile: null });
            setShowUploadForm(false);
            setError("");
        } catch (err) {
            setError("Failed to upload resource.");
            console.error(err);
        }
    };

    const handleDeleteResource = async (resourceId) => {
        try {
            await axiosInstance.delete(`/resource/${resourceId}/delete`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            });
            setResources((prev) => prev.filter((resource) => resource._id !== resourceId));
        } catch (err) {
            setError("Failed to delete resource.");
            console.error(err);
        }
    };

    const handleFileUpload = async () => {
        if (!newResource.selectedFile) {
            alert("Please select a file before uploading.");
            return;
        }

        const formData = new FormData();
        formData.append("file", newResource.selectedFile);

        try {
            const { data } = await axiosInstance.post("/resource/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!data.fileUrl) throw new Error("File upload failed, URL not received.");

            setNewResource({ ...newResource, fileUrl: data.fileUrl });
            alert("File uploaded successfully!");
        } catch (error) {
            console.error("File upload error:", error);
            alert("Failed to upload the file.");
        }
    };

    const handleDownload = async (fileUrl, filename) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename || "downloaded_file");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Allocations</h2>
            {error && (
                <p className="text-red-600 font-medium bg-red-100 p-2 rounded">{error}</p>
            )}

            {/* Allocations List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allocations.length > 0 ? (
                    allocations.map((allocation) => (
                        <div
                            key={allocation._id}
                            className={`p-4 border rounded-lg shadow-sm flex flex-col justify-between
                                ${allocation.taskStatus === "complete"
                                    ? "bg-green-50 border-green-400"
                                    : "bg-white border-gray-300"
                                }`}>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">{allocation.title}</h3>
                                <p className="text-gray-600 mt-1">{allocation.description}</p>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-between gap-2">
                                <button
                                    onClick={() => setSelectedAllocationId(allocation._id)}
                                    className="text-blue-700 hover:bg-blue-50 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
                                    title="View Details"
                                    aria-label={`View details of ${allocation.title}`}
                                >
                                    View Details
                                    <ChevronDownIcon size={18} />
                                </button>
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => handleDeleteAllocation(allocation._id)}
                                        className="text-red-700 hover:bg-red-100 flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md"
                                        title="Delete Allocation"
                                        aria-label={`Delete ${allocation.title}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleMarkAsComplete(allocation._id)}
                                        className={`bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${allocation.taskStatus === "complete" ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                        disabled={allocation.taskStatus === "complete"}
                                        title="Mark As Complete"
                                        aria-label={`Mark ${allocation.title} as complete`}
                                    >
                                        <CheckCircle size={18} />
                                        {allocation.taskStatus === "complete"
                                            ? "Completed"
                                            : "Mark Complete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full">No allocations assigned.</p>
                )}
            </div>

            {/* Task Details Section */}
            {selectedAllocationId && (
                <section className="task-details mt-10 p-6 bg-white rounded-lg shadow-lg space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Task Details</h3>

                    {/* Task Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                            {task ? (
                                <>
                                    <p>
                                        <span className="font-semibold">Title:</span> {task.title}
                                    </p>
                                    <p className="mt-1">
                                        <span className="font-semibold">Description:</span>{" "}
                                        {task.description}
                                    </p>
                                    <p className="mt-1">
                                        <span className="font-semibold">Deadline:</span>{" "}
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}
                                    </p>
                                    <p className="mt-1">
                                        <span className="font-semibold">Assigned By:</span>{" "}
                                        {task.assignedBy?.name || "N/A"}
                                    </p>
                                    <p className="mt-1">
                                        <span className="font-semibold">Created At:</span>{" "}
                                        {new Date(task.createdAt).toLocaleString()}
                                    </p>
                                </>
                            ) : (
                                <p>Loading task details...</p>
                            )}
                        </div>

                        {/* Assigned Users */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-semibold mb-2">Assigned Users</h4>
                            {assignedUsers.length > 0 ? (
                                <ul className="list-disc list-inside text-gray-700">
                                    {assignedUsers.map((user) => (
                                        <li key={user._id}>{user.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No users assigned to this task.</p>
                            )}
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold">Resources</h4>
                            <button
                                onClick={() => setShowUploadForm((v) => !v)}
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md"
                                title="Add Resource"
                                aria-label="Add new resource"
                            >
                                {showUploadForm ? <ChevronUp size={18} /> : <PlusIcon size={18} />}
                                Add Resource
                            </button>
                        </div>

                        {resources.length > 0 ? (
                            <ul className="space-y-3">
                                {resources.map((resource) => (
                                    <li
                                        key={resource._id}
                                        className="flex items-center justify-between bg-white rounded-md border border-gray-300 p-3 shadow-sm"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-800">{resource.title}</p>
                                            <p className="text-gray-600 text-sm">{resource.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    handleDownload(resource.fileUrl, resource.title)
                                                }
                                                title="Download Resource"
                                                aria-label={`Download ${resource.title}`}
                                                className="text-blue-700 hover:bg-blue-100 flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteResource(resource._id)}
                                                title="Delete Resource"
                                                aria-label={`Delete ${resource.title}`}
                                                className="text-red-700 hover:bg-red-100 flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No resources available for this task.</p>
                        )}

                        {/* Upload Form */}
                        {showUploadForm && (
                            <form
                                onSubmit={handleResourceUpload}
                                className="mt-6 space-y-4 border-t pt-4"
                            >
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-title">
                                        Title
                                    </label>
                                    <input
                                        id="resource-title"
                                        type="text"
                                        value={newResource.title}
                                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter resource title"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-desc">
                                        Description
                                    </label>
                                    <textarea
                                        id="resource-desc"
                                        value={newResource.description}
                                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter resource description"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-filetype">
                                        File Type
                                    </label>
                                    <select
                                        id="resource-filetype"
                                        value={newResource.fileType}
                                        onChange={(e) => setNewResource({ ...newResource, fileType: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select file type</option>
                                        <option value="pdf">PDF</option>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                        <option value="doc">Document</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1" htmlFor="resource-file">
                                        File Upload
                                    </label>

                                    <div className="flex item-center">
                                        <input
                                            id="resource-file"
                                            type="file"
                                            onChange={(e) => setNewResource({ ...newResource, selectedFile: e.target.files[0] })}
                                            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            accept="*"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleFileUpload}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Upload File
                                        </button>
                                    </div>

                                    {newResource.fileUrl && (
                                        <div className="mt-2 text-sm text-blue-600">
                                            Uploaded file: <a href={newResource.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">View File</a>
                                        </div>
                                    )}
                                </div>

                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 -mx-4 -mb-5 rounded-b-lg">
                                    <button
                                        type="submit"
                                        className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        <UploadCloud size={18} />
                                        Upload Resource
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Allocations;


